import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export const baseApiUrlInterceptor = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  // Log для отладки
  const apiUrl = environment.apiUrl;
  const windowApiUrl = (window as any)['API_URL'];

  console.log('🔍 Interceptor Debug:');
  console.log('  environment.apiUrl:', apiUrl);
  console.log('  window.API_URL:', windowApiUrl);
  console.log('  request URL:', req.url);

  const apiReq = req.clone({ url: `${apiUrl}/${req.url}` });

  console.log('  final URL:', apiReq.url);

  return next(apiReq);
};
