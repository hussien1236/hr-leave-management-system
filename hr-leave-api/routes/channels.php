<?php

use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Log;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('user.{id}', function ($user, $id) {
    if((int) $user->id === (int) $id)
        Log::info("User {$user->id} is listening to channel user.{$id}");
     else
        Log::warning("User {$user->id} is NOT authorized to listen to channel user.{$id}"); 
    return (int) $user->id === (int) $id; // Only allow that user to listen
}); 

Broadcast::channel('manager.notifications', function ($user) {
    if($user->role === 'manager' || $user->role === 'admin')
        Log::info("User {$user->id} with role {$user->role} is listening to channel manager.notifications");
     else
        Log::warning("User {$user->id} with role {$user->role} is NOT authorized to listen to channel manager.notifications");
    return $user->role === 'manager' || $user->role === 'admin'; // Only allow managers and admins to listen
});