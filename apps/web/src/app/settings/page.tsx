'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { User, Bell, Palette, Save } from 'lucide-react';

export default function SettingsPage() {
  const { addToast } = useToast();
  const [emailNotifications, setEmailNotifications] = React.useState(true);
  const [pushNotifications, setPushNotifications] = React.useState(false);
  const [approvalReminders, setApprovalReminders] = React.useState(true);
  const [weeklyDigest, setWeeklyDigest] = React.useState(true);

  function handleSave() {
    addToast({
      title: 'Settings saved',
      description: 'Your preferences have been updated',
      variant: 'success',
    });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Profile */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
              <User className="text-primary h-5 w-5" />
            </div>
            <div>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Your account information</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-6">
            <div className="bg-primary text-primary-foreground flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold">
              SK
            </div>
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" defaultValue="Sai Krishna S" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="sks@spendflow.in" />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" defaultValue="Finance Lead" disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input id="department" defaultValue="Finance & Accounting" disabled />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Theme */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
              <Palette className="text-primary h-5 w-5" />
            </div>
            <div>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize the look and feel</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Theme</p>
              <p className="text-muted-foreground text-sm">Choose between light, dark, or system</p>
            </div>
            <ThemeToggle />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
              <Bell className="text-primary h-5 w-5" />
            </div>
            <div>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Manage how you receive updates</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <NotificationToggle
            label="Email Notifications"
            description="Receive email updates for bill submissions and approvals"
            checked={emailNotifications}
            onCheckedChange={setEmailNotifications}
          />
          <Separator />
          <NotificationToggle
            label="Push Notifications"
            description="Browser push notifications for urgent items"
            checked={pushNotifications}
            onCheckedChange={setPushNotifications}
          />
          <Separator />
          <NotificationToggle
            label="Approval Reminders"
            description="Get reminded about pending approvals after 24 hours"
            checked={approvalReminders}
            onCheckedChange={setApprovalReminders}
          />
          <Separator />
          <NotificationToggle
            label="Weekly Digest"
            description="Summary of spending and approvals every Monday"
            checked={weeklyDigest}
            onCheckedChange={setWeeklyDigest}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="gap-2">
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}

function NotificationToggle({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} aria-label={label} />
    </div>
  );
}
