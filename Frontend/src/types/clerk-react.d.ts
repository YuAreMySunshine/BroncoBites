declare module '@clerk/clerk-react' {
  import * as React from 'react'

  export const ClerkProvider: React.ComponentType<any>
  export const SignedIn: React.ComponentType<any>
  export const SignedOut: React.ComponentType<any>
  export const SignInButton: React.ComponentType<any>
  export const SignUpButton: React.ComponentType<any>
  export const UserButton: React.ComponentType<any>

  // Fallback exports for other named exports
  export const withClerk: any
  export const useUser: any
  export const useClerk: any

  const _default: any
  export default _default
}
