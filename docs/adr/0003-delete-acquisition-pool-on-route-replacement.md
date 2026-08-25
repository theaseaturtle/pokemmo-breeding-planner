# Delete the acquisition pool when replacing a route

A confirmed Route Replacement deletes every record in the old Plan Acquisition Pool, including acquired parents, acquired items, actual prices, and notes. The planner asks for explicit confirmation before deletion, and Long-Term Inventory remains unchanged. This rejects silent cross-route reuse and automatic inventory transfer: both would blur which plan a purchase served and previously allowed records with structurally identical resource-group keys to enter an unrelated execution plan.
