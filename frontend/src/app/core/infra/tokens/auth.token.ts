import { InjectionToken } from "@angular/core";
import { ITenantContextPort } from "../../domain/ports/tenant-context.port";
import { IAuthApiPort } from "../../domain/ports/auth-api.port";

export const AUTH_API_PORT = new InjectionToken<IAuthApiPort>('AUTH_API_PORT');
export const TENANT_CONTEXT_PORT = new InjectionToken<ITenantContextPort>('TENANT_CONTEXT_PORT');