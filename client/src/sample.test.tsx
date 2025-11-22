describe('Sample Test Suite', () => {
    test('trivial test: 1 + 1 should equal 2', () => {
        expect(1 + 1).toBe(2);
    });

    test('trivial test: true should be truthy', () => {
        expect(true).toBeTruthy();
    });

    test('trivial test: empty array should have length 0', () => {
        expect([].length).toBe(0);
    });
});
