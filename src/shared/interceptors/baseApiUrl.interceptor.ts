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
  const apiReq = req.clone({ url: `${apiUrl}/api/${req.url}` });
  return next(apiReq);
};
