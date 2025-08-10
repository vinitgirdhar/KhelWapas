
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function AdminUsersPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Users</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <span>User Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>A list of all registered users will be displayed here.</p>
          {/* Placeholder for users table */}
        </CardContent>
      </Card>
    </div>
  );
}
