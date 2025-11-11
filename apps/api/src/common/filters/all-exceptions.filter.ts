import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from "@nestjs/common";
import { Request, Response } from "express";

interface ProblemDetails {
  status: number;
  title: string;
  detail?: string;
  instance?: string;
  errors?: Record<string, string[]>;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let title = "Internal Server Error";
    let detail: string | undefined;
    let errors: Record<string, string[]> | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse() as any;
      title = res?.title ?? exception.name;
      detail = res?.message ?? exception.message;
      errors = res?.errors;
    } else if (exception instanceof Error) {
      detail = exception.message;
    }

    this.logger.error(`Request failed: ${request.method} ${request.url}`, exception as any);

    const problem: ProblemDetails = {
      status,
      title,
      detail,
      instance: request.originalUrl,
      errors
    };

    response.status(status).json(problem);
  }
}
