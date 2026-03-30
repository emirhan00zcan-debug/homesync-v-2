import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    const pathname = request.nextUrl.pathname;

    // Protect Dashboard Routes
    if (pathname.startsWith('/dashboard')) {
        if (!user) {
            return NextResponse.redirect(new URL('/auth?mode=LOGIN', request.url))
        }

        const rawRole = (user.user_metadata?.role || 'alici').toLowerCase();
        const role = ['alici', 'usta', 'satici', 'admin', 'super_admin'].includes(rawRole) ? rawRole : 'alici';

        // Admin Protection
        if (pathname.startsWith('/dashboard/super-admin') && !['super_admin', 'SUPER_ADMIN'].includes(role)) {
            return NextResponse.redirect(new URL('/unauthorized', request.url))
        }
        if (pathname.startsWith('/dashboard/admin') && !['admin', 'super_admin', 'ADMIN', 'SUPER_ADMIN'].includes(role)) {
            return NextResponse.redirect(new URL('/unauthorized', request.url))
        }

        // Vendor/Technician specific checks (Mapped to satici/usta)
        if (role === 'satici' || role === 'usta' || role === 'VENDOR' || role === 'TECHNICIAN') {
            const isVendorRoute = pathname.startsWith('/dashboard/vendor') || pathname.startsWith('/dashboard/satici');
            const isTechRoute = pathname.startsWith('/dashboard/technician') || pathname.startsWith('/dashboard/usta');

            // Normalized role for comparison
            const normRole = (role === 'satici' || role === 'VENDOR') ? 'satici' : 'usta';

            // Wrong dashboard path
            if ((normRole === 'satici' && isTechRoute) || (normRole === 'usta' && isVendorRoute)) {
                return NextResponse.redirect(new URL('/unauthorized', request.url))
            }

            // Verification check (only once if not on verification page/onboarding)
            if (!pathname.startsWith('/dogrulama-merkezi') &&
                !pathname.startsWith('/dashboard/verify') &&
                !pathname.startsWith('/auth/vendor-onboarding') &&
                !pathname.startsWith('/auth/technician-onboarding')) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('status, is_verified, is_identity_verified')
                    .eq('id', user.id)
                    .single();

                const status = (profile?.status || 'pending').toLowerCase();
                const isVerified = !!profile?.is_verified;
                const isIdVerified = !!profile?.is_identity_verified;

                // If NOT fully verified (identity + admin approval), force onboarding/verification center
                // unless they are explicitly in the pending state where they can see limited dashboard.
                if (profile && (!isIdVerified || (!isVerified && !['pending', 'pending_approval'].includes(status)))) {
                    const onboardingUrl = normRole === 'satici'
                        ? '/auth/vendor-onboarding'
                        : '/auth/technician-onboarding';
                    return NextResponse.redirect(new URL(onboardingUrl, request.url))
                }
            }
        }

        // Root dashboard redirector
        if (pathname === '/dashboard') {
            switch (role.toLowerCase()) {
                case 'super_admin': return NextResponse.redirect(new URL('/dashboard/super-admin', request.url));
                case 'admin': return NextResponse.redirect(new URL('/dashboard/admin', request.url));
                case 'satici':
                case 'vendor': return NextResponse.redirect(new URL('/dashboard/vendor', request.url));
                case 'usta':
                case 'technician': return NextResponse.redirect(new URL('/dashboard/technician', request.url));
                default: return NextResponse.redirect(new URL('/dashboard/customer', request.url));
            }
        }
    }

    // Protect Checkout Route
    if (pathname.startsWith('/checkout') && !user) {
        return NextResponse.redirect(new URL('/auth?mode=LOGIN', request.url))
    }

    // Protected /usta, /pro, /seller Routes from Customers
    const authRole = user ? (user.user_metadata?.role || 'alici').toLowerCase() : null;

    if (pathname.startsWith('/usta') || pathname.startsWith('/pro') || pathname.startsWith('/seller')) {
        if (!user) {
            return NextResponse.redirect(new URL('/auth?mode=LOGIN', request.url))
        }
        if (authRole === 'alici' || authRole === 'customer') {
            return NextResponse.redirect(new URL('/profile', request.url))
        }
    }

    // Protect /admin Routes
    if (pathname.startsWith('/admin')) {
        if (!user) {
            return NextResponse.redirect(new URL('/auth?mode=LOGIN', request.url))
        }
        if (!['admin', 'super_admin', 'ADMIN', 'SUPER_ADMIN'].includes(authRole || '')) {
            return NextResponse.redirect(new URL('/unauthorized', request.url))
        }
    }

    return response
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
