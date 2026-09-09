import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { UrlTenantContextAdapter } from './infra/adapter/url-tenant-context.adapter';
import { tenantInterceptor } from './infra/interceptors/tenant.interceptor';
import { TENANT_CONTEXT_PORT } from './infra/token/auth.token';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(withInterceptors([tenantInterceptor])),
    {
      provide: TENANT_CONTEXT_PORT,
      useClass: UrlTenantContextAdapter,
    },
  ]
};
