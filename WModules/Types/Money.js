export class Money extends Number {
    constructor(amount, currency = 'USD') {
        super(amount);

        this.currency = currency.toUpperCase();

        const decimals = Money.#getCurrencyDecimals(this.currency);
        const factor = 10 ** decimals;

        // 🔑 Nuevo: representación interna precisa
        this._minor = Math.round(Number(amount) * factor);
    }

    // ---- REGISTRO ----
    static #CurrencyMeta = new Map([
        ['USD', { locale: 'en-US', decimals: 2 }],
        ['NIO', { locale: 'es-NI', decimals: 2 }],
        ['EUR', { locale: 'es-ES', decimals: 2 }],
    ]);

    static registerCurrency(code, locale, decimals = 2) {
        Money.#CurrencyMeta.set(code.toUpperCase(), { locale, decimals });
    }

    static #getCurrencyMeta(currency) {
        return Money.#CurrencyMeta.get(currency) ?? { locale: 'en-US', decimals: 2 };
    }

    static #getCurrencyDecimals(currency) {
        return Money.#getCurrencyMeta(currency).decimals;
    }

    // ---- CORE NUEVO (preciso) ----

    add(other) {
        const o = Money.#normalize(other, this.currency);
        this.#assertSameCurrency(o);

        return Money.#fromMinor(this._minor + o._minor, this.currency);
    }

    subtract(other) {
        const o = Money.#normalize(other, this.currency);
        this.#assertSameCurrency(o);

        return Money.#fromMinor(this._minor - o._minor, this.currency);
    }

    multiply(factor, { rounding = 'HALF_UP' } = {}) {
        const result = Money.#round(this._minor * factor, rounding);
        return Money.#fromMinor(result, this.currency);
    }

    divide(divisor, { rounding = 'HALF_UP' } = {}) {
        const result = Money.#round(this._minor / divisor, rounding);
        return Money.#fromMinor(result, this.currency);
    }

    static #normalize(value, currency) {
        if (value instanceof Money) return value;

        if (typeof value === 'number') {
            return new Money(value, currency);
        }

        throw new Error('Invalid operand');
    }

    static #fromMinor(minor, currency) {
        const decimals = Money.#getCurrencyDecimals(currency);
        const factor = 10 ** decimals;

        const obj = new Money(minor / factor, currency);
        obj._minor = minor; // evitar doble redondeo
        return obj;
    }

    #assertSameCurrency(other) {
        if (this.currency !== other.currency) {
            throw new Error(`Currency mismatch: ${this.currency} vs ${other.currency}`);
        }
    }

    // ---- ROUNDING ----

    static #round(value, mode) {
        switch (mode) {
            case 'HALF_UP': return Math.round(value);
            case 'DOWN': return Math.floor(value);
            case 'UP': return Math.ceil(value);
            default: throw new Error('Unknown rounding mode');
        }
    }

    // ---- COMPATIBILIDAD ----

    /**
     * 🔁 Sigue devolviendo float para no romper código existente
     */
    valueOf() {
        return super.valueOf();
    }

    /**
     * 🆕 Valor preciso recomendado
     */
    toNumber() {
        const decimals = Money.#getCurrencyDecimals(this.currency);
        return this._minor / (10 ** decimals);
    }

    // ---- FORMATO ----

    Format(opts = {}) {
        const { locale, formatOptions = {} } = opts;

        const meta = Money.#getCurrencyMeta(this.currency);

        return new Intl.NumberFormat(
            locale ?? meta.locale,
            {
                style: 'currency',
                currency: this.currency,
                ...formatOptions
            }
        ).format(this.toNumber()); // 🔑 usar valor preciso
    }

    toString() {
        return this.Format();
    }

    // ---- UTILIDADES ----

    equals(other) {
        return other instanceof Money &&
            this.currency === other.currency &&
            this._minor === other._minor;
    }

    // ---- CONVERSIÓN ----

    ConvertTo(currency, rate = 1, { rounding = 'HALF_UP' } = {}) {
        const decimals = Money.#getCurrencyDecimals(currency);
        const factor = 10 ** decimals;

        const base = this.toNumber() * rate;
        const minor = Money.#round(base * factor, rounding);

        return Money.#fromMinor(minor, currency);
    }

    greaterThan(other) {
        if (!(other instanceof Money)) {
            throw new Error('Operand must be Money');
        }
        if (this.currency !== other.currency) {
            throw new Error(`Currency mismatch: ${this.currency} vs ${other.currency}`);
        }
        return this._minor > other._minor;
    }

    lessThan(other) {
        if (!(other instanceof Money)) {
            throw new Error('Operand must be Money');
        }
        if (this.currency !== other.currency) {
            throw new Error(`Currency mismatch: ${this.currency} vs ${other.currency}`);
        }
        return this._minor < other._minor;
    }

    equals(other) {
        return other instanceof Money &&
            this.currency === other.currency &&
            this._minor === other._minor;
    }
    isZero() {
        return this._minor === 0;
    }
}