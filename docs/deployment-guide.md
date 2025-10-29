# 🚀 MacroDash Manual Deployment Guide

This guide explains how to deploy the MacroDash platform manually including both AWS CLI and AWS Console paths for each AWS operation.

---

## Deployment Overview

| Component | Tech Stack | Hosting |
|----------|------------|---------|
| Frontend | React + Vite | S3 + CloudFront |
| Backend | Django + Gunicorn | AWS Lightsail Container Service |
| Images | Docker | Docker Hub |

---

## Environment Setup

Run:
### Mac / Linux

```bash
brew install awscli docker git yarn
```

### Windows (PowerShell)

```bash
choco install awscli docker git yarn
```

Ensure:

* You have access to the MacroDash deployment AWS IAM user credentials with AdministratorAccess (or Lightsail + CloudFront + S3 permissions).
* You have the MacroDash Docker Hub credentials (username + access token).

If you need access to either of those, please contact Taaha Bin Mohsin at tb3486@nyu.edu.

### Configure AWS CLI Authentication
Run:
```bash
aws configure
```
and when prompted, provide the following:
```bash
AWS Access Key ID [None]: <YOUR_ACCESS_KEY_ID>
AWS Secret Access Key [None]: <YOUR_SECRET_ACCESS_KEY>
Default region name [None]: us-east-2
Default output format [None]: json
```

### Docker login

You'll need to run:
```bash
docker login -u teammacrodash -p <personal-access-token>
```


## Deploy Frontend (React SPA)

### Requirements
* AWS CLI installed or access to AWS Console
* `.env.production` configured with:

        VITE_API_BASE_URL=https://macrodash.xyz/api

---

### Steps

(1) Build the client bundle locally

```bash
cd client
yarn install
yarn build
```

This should create/update the `dist` directory with the relevant generated assets.

(2) Upload the bundle to S3

This can either be done via the AWS CLI or the AWS console UI. If you take the former approach, do:

```bash
cd client
aws s3 sync dist s3://macrodash-client --delete
```

If you elect to use the console UI, the steps are:
1. Go to AWS Console -> S3
2. Select your bucket (macrodash-client)
3. Click Upload
4. Upload the contents of the `client/dist/` directory
5. Save

(3) Refresh the Cloudfront cache

Cloundfront caches content pretty aggressively, so manually triggering an invalidation right after a deployment is often
a good idea to make sure the latest version of MacroDash is available immediately. Once again, you can choose to use the
 AWS CLI or the console UI. If you opt for the former, run:

```bash
aws cloudfront create-invalidation \
  --distribution-id <CF_DIST_ID> \
  --paths "/*"
```

If you decide to the use the console UI instead, the steps are:

1. Navigate to AWS Console -> CloudFront -> The distribution named 'macrodash-cloudfront'
2. Open the 'Invalidations' tab
3. Create Invalidation → Path: /*
4. Click Invalidate

This should successfully deploy the React SPA.


## Deploy Backend (Django API)

### Requirements

* Docker installed
* Docker Hub login with the MacroDash Docker account
* AWS CLI or access to Lightsail Console

1. Build the Docker image for the Django API using:
```bash
cd server
VERSION_TAG=$(git rev-parse --short HEAD)
docker build --platform linux/amd64 \
  -t teammacrodash/macrodash-server:latest \
  -t teammacrodash/macrodash-server:$VERSION_TAG .
```

2. Push the image to Docker Hub using:
```bash
docker login -u teammacrodash -p <personal-access-token>
docker push teammacrodash/macrodash-server:latest
docker push teammacrodash/macrodash-server:$VERSION_TAG
```

3. Push image into Lightsail container service

If you elect to use the AWS CLI, run:
```bash
aws lightsail push-container-image \
  --service-name macrodash-server \
  --label macrodash \
  --image teammacrodash/macrodash-server:$VERSION_TAG OR teammacrodash/macrodash-server:latest
```

Note: If prompted, install lightsailctl:
https://lightsail.aws.amazon.com/ls/docs/en_us/articles/amazon-lightsail-install-software

If, instead, you choose to the use the console UI, the steps are:
1. Open AWS Console -> Lightsail
2. Select Containers -> "macrodash-server"
3. Click 'Modify your deployment'
4. Update the 'Image' field to 'teammacrodash/macrodash-server:$VERSION_TAG' or just 'teammacrodash/macrodash-server:latest'
5. Click 'Save and deploy'


## Rollback procedure

In case something goes wrong or you simply want to revert to the previous version of MacroDash, you can do the following:

### Frontend Rollback

Upload previous dist/ build backup to S3:

```bash
aws s3 sync dist_backup s3://macrodash-client --delete
```

or checkout the previous commit on `main` via git, regenerate the `dist` directory, and upload the files inside it
manually to S3.

### Backend Rollback

Redeploy an older tag:

```bash
aws lightsail push-container-image \
  --service-name macrodash-server \
  --label macrodash \
  --image teammacrodash/macrodash-server:$OLDER_VERSION_TAG

```

or via Lightsail console: redeploy previous revision from the 'Deployment versions' section.


