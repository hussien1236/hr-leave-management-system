<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    public function createUser(Request $r){
        $data = $r->only('name','email','password','role','department_id');
        $validator = Validator::make($data, [
            'name'=>'required|string',
            'email'=>'required|email|unique:users',
            'password'=>'required|min:6',
            'role'=>'in:admin,manager,employee'
        ]);
        if ($validator->fails()) return response()->json($validator->errors(),422);
        $data['password'] = bcrypt($data['password']);
        $user = User::create($data);
        return response()->json(['message'=>'created','user'=>$user],201);
    }
    public function login(Request $request)
    {
        $credentials = $request->only('email', 'password');
        if(!$token = Auth::guard('api')->attempt($credentials)) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
        return $this->respondWithToken($token);
    }

    public function me()
    {
        return response()->json(auth('api')->user());
    }
    protected function respondWithToken($token) {
        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => auth('api')->factory()->getTTL() * 60
            ]);
    }
}
