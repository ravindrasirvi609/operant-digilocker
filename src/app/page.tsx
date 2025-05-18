import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      <p className="text-muted-foreground">
        Welcome to the Operant DigiLocker Admin Dashboard. Use the options below
        to manage certificates.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upload Excel</CardTitle>
            <CardDescription>
              Upload an Excel file containing user data to generate
              certificates.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/upload">
              <Button className="w-full" size="lg">
                Upload Excel
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>View Data</CardTitle>
            <CardDescription>
              View and manage user data and certificates.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/view">
              <Button className="w-full" variant="outline" size="lg">
                View Data
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
