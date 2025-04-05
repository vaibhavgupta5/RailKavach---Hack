import { NextRequest, NextResponse } from 'next/server';
import { startTrainTracking, isTrackingRunning } from '@/lib/trainTrackingSetup';

let trackingStopFn: (() => void) | null = null;

if (process.env.NODE_ENV === 'production' || process.env.ENABLE_TRAIN_TRACKING === 'true') {
  if (!isTrackingRunning()) {
    trackingStopFn = startTrainTracking();
    
    process.on('SIGTERM', () => {
      if (trackingStopFn) {
        trackingStopFn();
      }
    });
  }
}

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === '/api/admin/tracking-status') {
    return NextResponse.json({
      isRunning: isTrackingRunning(),
      environment: process.env.NODE_ENV,
      startedAt: isTrackingRunning() ? 
        new Date(fs.readFileSync(UPDATE_FLAG_FILE, 'utf8')).toISOString() : null,
      nextUpdateIn: trackingStopFn ? 
        `${Math.floor((600000 - (Date.now() % 600000)) / 1000)} seconds` : null
    });
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/api/admin/tracking-status',
};