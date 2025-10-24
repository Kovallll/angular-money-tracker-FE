import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../constants';

export const baseApiUrlInterceptor = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  const apiReq = req.clone({ url: `${API_URL}/${req.url}` });
  return next(apiReq);
};
