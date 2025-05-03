export const pushAnalytics = (...args) => {
    const payload = ["event", ...args];

    window.gtag.apply(this, payload);
};