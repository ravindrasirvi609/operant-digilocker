"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import Link from "next/link";

interface User {
  _id: string;
  name: string;
  conferenceId: string;
  email: string;
  digiLockerId: string;
  date: string;
  certificateUri?: string;
  certificateS3Url?: string;
}

export default function ViewPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/view-data");

        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }

        const data = await response.json();
        setUsers(data.users);
      } catch (error) {
        toast.error(
          `Error: ${
            error instanceof Error ? error.message : "Failed to fetch users"
          }`
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold tracking-tight">View Data</h2>
        <Link href="/">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Data</CardTitle>
          <CardDescription>
            View and manage user data and certificates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-4">
              No users found. Upload an Excel file first.
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Conference ID</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>DigiLocker ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>URI</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.conferenceId}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.digiLockerId}</TableCell>
                      <TableCell>{formatDate(user.date)}</TableCell>
                      <TableCell>
                        {user.certificateUri ? (
                          <span className="text-sm text-muted-foreground break-all">
                            {user.certificateUri}
                          </span>
                        ) : (
                          "N/A"
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
