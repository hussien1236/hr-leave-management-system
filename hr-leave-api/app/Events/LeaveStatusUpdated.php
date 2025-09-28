<?php

namespace App\Events;

use App\Models\LeaveRequest;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class LeaveStatusUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(public LeaveRequest $leaveRequest)
    {
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
        public function broadcastWith()
    {
        return [
        // 'id' => $this->leaveRequest->id,
        'status' => $this->leaveRequest->status,
        // 'type' => $this->leaveRequest->type,
        'start_date' => $this->leaveRequest->start_date,
        'end_date' => $this->leaveRequest->end_date,
        ];
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.' . $this->leaveRequest->user_id),
        ];
    }
    public function broadcastAs()
    {
        return 'LeaveStatusUpdated';
    }
}
