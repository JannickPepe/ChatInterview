import "@testing-library/jest-dom";

// Mock `fetch` globally for all tests
global.fetch = jest.fn(() =>
    Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
    })
) as jest.Mock;