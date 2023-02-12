import { HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { shareReplay, tap } from 'rxjs/operators';
import { WebRequestService } from './web-request.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private webService: WebRequestService,
    private router: Router
  ) { }


  login(email: string, password: string) {
    return this.webService.login(email, password).pipe(
      shareReplay(),
      tap((res: HttpResponse<any>) => {
        // The auth token is in the header
        this.setSession(
          res.body._id,
          res.headers.get('x-access-token') ?? '',
          res.headers.get('x-refresh-token') ?? '',
        );
      })
    );
  }

  logout() {
    this.removeSession();
  }

  getAccessToken() {
    return localStorage.getItem('x-access-token');
  }

  setAccessToken(accessToken: string) {
    localStorage.setItem('x-access-token', accessToken);
  }

  getRefreshToken() {
    return localStorage.getItem('x-refresh-token');
  }

  private setSession(userId: string, accessToken: string, refreshToken: string) {
    localStorage.setItem('userId', userId);
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  private removeSession() {
    localStorage.removeItem('userId');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
}
