// app/api/grounding-api/route.js
import { NextResponse } from 'next/server';

export async function GET(request: any) {
  const { searchParams } = new URL(request.url);
  const redirectURL = searchParams.get('url');

  if (!redirectURL) {
    return NextResponse.json({ error: 'Missing URL parameter' }, { status: 400 });
  }

  try {
    const response = await fetch(redirectURL, {
      redirect: 'follow',
    });

    if (!response.ok) {
      console.error(`HTTP error! Status: ${response.status}`);
      return NextResponse.json(
        { error: `HTTP error! Status: ${response.status}` },
        { status: response.status }
      );
    }

    const finalURL = response.url;
    return NextResponse.json({ url: finalURL }, { status: 200 });
  } catch (error) {
    console.error('Error resolving redirect:', error);
    return NextResponse.json(
      { error: 'Error resolving redirect' },
      { status: 500 }
    );
  }
}