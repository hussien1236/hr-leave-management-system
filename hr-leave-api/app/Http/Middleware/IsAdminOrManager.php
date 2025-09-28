<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IsAdminOrManager
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = auth('api')->user()?? request()->user();
        if(!$user || ($user->role !== 'admin' && $user->role !== 'manager')) return response()->json(['error'=>'Forbidden (admin only)'],403);
        return $next($request);
    }
}
