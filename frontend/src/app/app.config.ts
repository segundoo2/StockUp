import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { UrlTenantContextAdapter } from './core/infra/adapters/url-tenant-context.adapter';
import { tenantInterceptor } from './core/infra/interceptors/tenant.interceptor';
import { TENANT_CONTEXT_PORT } from './core/infra/tokens/auth.token';

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
