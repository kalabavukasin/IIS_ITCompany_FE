import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  dropdownOpen = false;
  isAuthenticated = false; 
  isAdmin = false;
  userId = 0 
  role: string | null = null; 

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.loggedInUser$.subscribe(user => {
      this.isAuthenticated = !!user;
      if(user){
        this.userId = user.id;
        this.role = user.role;
      }
      else{
        this.role = null;
      }
    });
  }
  logout() {
    console.log('Logout clicked');  
    this.authService.logout();
    console.log('Navigating to login...');  
    this.router.navigateByUrl('/login'); 
  }
}
