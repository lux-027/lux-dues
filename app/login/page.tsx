import { redirect } from 'next/navigation';

// The standalone bare login page has been replaced by the landing page
// at "/", which opens the login/register flow in a modal (see AuthModal).
// This route is kept for backwards-compatible links and simply forwards
// visitors to the landing page with the login modal open.
export default function LoginRedirect() {
  redirect('/?auth=login');
}
