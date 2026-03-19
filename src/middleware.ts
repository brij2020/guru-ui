import { NextResponse } from "next/server";
import type { NextRequest } from 'next/server'

const locales = ['en', 'hi']

// Get the preferred locale, similar to the above or using a library
function getLocale(request: NextRequest): string {
    // Try to get the preferred language from the Accept-Language header
    const acceptLanguage = request.headers.get('accept-language');
    if (acceptLanguage) {
        const preferred = acceptLanguage.split(',')[0].split('-')[0];
        if (locales.includes(preferred)) {
            return preferred;
        }
    }
    // Default to 'en'
    return 'en';
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip middleware for:
    // 1. Next.js internals
    // 2. Static files (including favicons, images, etc.)
    // 3. API routes
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api/') ||
        pathname.includes('/favicon') ||
        pathname.includes('/icon') ||
        pathname.includes('/apple-touch-icon') ||
        pathname.includes('.ico') ||
        pathname.includes('.png') ||
        pathname.includes('.jpg') ||
        pathname.includes('.jpeg') ||
        pathname.includes('.gif') ||
        pathname.includes('.svg') ||
        pathname.includes('.css') ||
        pathname.includes('.js')
    ) {
        return NextResponse.next();
    }

    // Check if there is any supported locale in the pathname
    const pathnameHasLocale = locales.some(
        (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    );

    if (pathnameHasLocale) return;

    // Redirect to add locale
    const locale = getLocale(request);
    request.nextUrl.pathname = `/${locale}${pathname}`;
    return NextResponse.redirect(request.nextUrl);
}

export const config = {
    matcher: [
        // Skip all internal paths (_next) and static files
        '/((?!_next|api|favicon.ico|icon|apple-touch-icon|.*\\.(?:ico|png|jpg|jpeg|gif|svg|css|js)$).*)',
    ],
}


/* 

import { NextResponse } from "next/server";

const locales = ['en', 'hi']

// Get the preferred locale, similar to the above or using a library
function getLocale(request: Request): string {
    // Try to get the preferred language from the Accept-Language header
    const acceptLanguage = request.headers.get('accept-language');
    if (acceptLanguage) {
        const preferred = acceptLanguage.split(',')[0].split('-')[0];
        if (locales.includes(preferred)) {
            return preferred;
        }
    }
    // Default to 'en'
    return 'en';
}

export function middleware(request: Request) {
    // Check if there is any supported locale in the pathname
    const url = new URL(request.url)
    const { pathname } = url
    const pathnameHasLocale = locales.some(
        (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    ) 

    if (pathnameHasLocale) return

    const locale = getLocale(request)
    url.pathname = `/${locale}${pathname}`
    // e.g. incoming request is /products
    // The new URL is now /en-US/products
    return NextResponse.redirect(url)
}

export const config = {
    matcher: [
        // Skip all internal paths (_next)
        '/((?!_next).*)',
        // Optional: only run on root (/) URL
        // '/'
    ],
}

*/