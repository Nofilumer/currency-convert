import { Routes } from '@angular/router';

export const routes: Routes = [
	{ path: '', redirectTo: 'convert', pathMatch: 'full' },
	{
		path: 'convert',
		loadComponent: () => import('./components/convert/convert.component').then(m => m.ConvertComponent)
	},
	{
		path: 'history',
		loadComponent: () => import('./components/history/history.component').then(m => m.HistoryComponent)
	},
	{ path: '**', redirectTo: 'convert' }
];
