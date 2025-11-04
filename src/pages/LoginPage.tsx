
import React from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 relative overflow-hidden">
      {/* Background SVG Animation */}
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 1600 800" 
        className="absolute inset-0 w-full h-full" 
        preserveAspectRatio="none"
      >
        <rect fill="#fff" width="1600" height="800" />
        <path
          fill="#f8fafc"
          d="M478.4 581c3.2 0.8 6.4 1.7 9.5 2.5c196.2 52.5 388.7 133.5 593.5 176.6c174.2 36.6 349.5 29.2 518.6-10.2V0H0v574.9c52.3-17.6 106.5-27.7 161.1-30.9C268.4 537.4 375.7 554.2 478.4 581z"
        />
        <path
          fill="#e2e8f0"
          d="M181.8 259.4c98.2 6 191.9 35.2 281.3 72.1c2.8 1.1 5.5 2.3 8.3 3.4c171 71.6 342.7 158.5 531.3 207.7c198.8 51.8 403.4 40.8 597.3-14.8V0H0v283.2C59 263.6 120.6 255.7 181.8 259.4z"
        />
        <path 
          fill="#dbeafe" 
          d="M454.9 86.3C600.7 177 751.6 269.3 924.1 325c208.6 67.4 431.3 60.8 637.9-5.3c12.8-4.1 25.4-8.4 38.1-12.9V0H288.1c56 21.3 108.7 50.6 159.7 82C450.2 83.4 452.5 84.9 454.9 86.3z" 
        />
        <path 
          fill="#bfdbfe" 
          d="M1397.5 154.8c47.2-10.6 93.6-25.3 138.6-43.8c21.7-8.9 43-18.8 63.9-29.5V0H643.4c62.9 41.7 129.7 78.2 202.1 107.4C1020.4 178.1 1214.2 196.1 1397.5 154.8z" 
        />
      </svg>

      {/* Login Card */}
      <Card className="w-full max-w-md mx-4 relative z-10 shadow-xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-2">
          {/* Logo */}
          <div className="flex items-center justify-center mb-4">
            <div className="text-blue-500 font-bold text-4xl mr-2">G</div>
            <div>
              <div className="text-gray-800 font-medium text-xl">eoloc</div>
              <div className="text-xs text-gray-500 -mt-1">SYSTEMS</div>
            </div>
          </div>
          <p className="text-sm text-gray-600 font-medium">
            Merci de saisir vos identifiants
          </p>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
