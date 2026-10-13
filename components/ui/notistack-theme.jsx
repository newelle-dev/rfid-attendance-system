"use client";

import { SnackbarProvider } from 'notistack';

export function NotistackProvider({ children }) {
  return (
    <SnackbarProvider
      maxSnack={3}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      autoHideDuration={3000}
      dense
      preventDuplicate
      classes={{
        variantSuccess: 'bg-green-500',
        variantError: 'bg-red-500',
        variantWarning: 'bg-yellow-500',
        variantInfo: 'bg-blue-500',
      }}
    >
      {children}
    </SnackbarProvider>
  );
}