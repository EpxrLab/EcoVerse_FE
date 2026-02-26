import { Card, CardContent } from '@/shared/components/ui/card';
import { Building2, Users, FileText, Calendar } from 'lucide-react';

export function PartnershipStats({ 
  partnershipType, 
  schoolsCount, 
  campaignsCount, 
  joinDate 
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-eco-blue/20 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-eco-blue" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Lĩnh vực</p>
              <p className="font-semibold">{partnershipType}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-eco-green/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-eco-green" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Trường tham gia</p>
              <p className="font-semibold">{schoolsCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-eco-orange/20 flex items-center justify-center">
              <FileText className="w-6 h-6 text-eco-orange" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Chiến dịch</p>
              <p className="font-semibold">{campaignsCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ngày tham gia</p>
              <p className="font-semibold">{joinDate}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}