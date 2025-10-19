import { BookOpen, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TechnologyCard = ({ technology, onViewTemplates, onViewRoadmap }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
            style={{ backgroundColor: `${technology.color}20` }}
          >
            {technology.icon}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{technology.name}</h3>
            <p className="text-sm text-gray-500">{technology.templates_count} templates</p>
          </div>
        </div>
        
        {technology.documentation_url && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(technology.documentation_url, '_blank')}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {technology.description}
      </p>
      
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewTemplates(technology)}
          className="flex-1"
        >
          <BookOpen className="h-4 w-4 mr-2" />
          Ver Templates
        </Button>
        
        <Button
          variant="default"
          size="sm"
          onClick={() => onViewRoadmap(technology)}
          className="flex-1"
        >
          Roadmap
        </Button>
      </div>
    </div>
  );
};

export default TechnologyCard;

