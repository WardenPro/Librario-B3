export class AppError extends Error {
    public statusCode: number;
    public details?: any;
    public error?: Error;

    constructor(
        message: string,
        statusCode: number,
        details?: any,
        error?: unknown,
    ) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
        if (error instanceof Error) this.error = error;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
