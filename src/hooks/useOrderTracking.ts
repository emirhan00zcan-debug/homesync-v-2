import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useOrderTracking(initialOrders: any[], userId: string | undefined) {
    const [orders, setOrders] = useState<any[]>(initialOrders);

    useEffect(() => {
        // Ensure initial orders are set properly on mount or when initial orders change
        setOrders(initialOrders);
    }, [initialOrders]);

    useEffect(() => {
        if (!userId) return;

        const supabase = createClient();

        const channel = supabase
            .channel(`order-tracking-${userId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'orders',
                    filter: `user_id=eq.${userId}`
                },
                (payload) => {
                    setOrders((currentOrders) =>
                        currentOrders.map((order) =>
                            order.id === payload.new.id ? { ...order, ...payload.new } : order
                        )
                    );
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId]);

    return orders;
}
