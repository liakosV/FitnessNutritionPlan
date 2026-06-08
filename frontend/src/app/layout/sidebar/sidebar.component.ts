import { Component, computed, inject } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';
import { NavigationService } from '../../core/services/navigation.service';

@Component({
  selector: 'app-sidebar',
  imports: [MatButtonModule, MatListModule, RouterLink, RouterLinkActive, TitleCasePipe],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  private readonly auth = inject(AuthService);
  private readonly navigation = inject(NavigationService);

  protected readonly currentUser = this.auth.currentUser;
  protected readonly navItems = computed(() => this.navigation.filterByRole(this.currentUser()?.role));
}
