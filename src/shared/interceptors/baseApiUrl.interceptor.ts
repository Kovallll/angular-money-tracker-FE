import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export const baseApiUrlInterceptor = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  if (req.url.startsWith('http://') || req.url.startsWith('https://')) {
    return next(req);
  }
  const apiUrl = environment.apiUrl;
  const fullUrl = `${apiUrl}/api/${req.url}`;
  if (typeof ngDevMode !== 'undefined' && ngDevMode) {
    console.log('[API]', req.method, fullUrl);
  }
  const apiReq = req.clone({ url: fullUrl });
  return next(apiReq);
};
