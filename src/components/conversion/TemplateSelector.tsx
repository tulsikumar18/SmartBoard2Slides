import React from "react";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TemplateOption {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  category: "professional" | "creative" | "minimal";
}

interface TemplateSelectorProps {
  selectedTemplate?: string;
  onSelectTemplate?: (templateId: string) => void;
  templates?: TemplateOption[];
}

const defaultTemplates: TemplateOption[] = [
  {
    id: "prof-1",
    name: "Corporate Blue",
    description:
      "Professional template with blue accents, ideal for business presentations",
    thumbnail:
      "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=400&q=80",
    category: "professional",
  },
  {
    id: "prof-2",
    name: "Executive Gray",
    description:
      "Clean, minimal design with subtle gray tones for executive presentations",
    thumbnail:
      "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&q=80",
    category: "professional",
  },
  {
    id: "creative-1",
    name: "Vibrant Gradient",
    description:
      "Colorful gradients and modern layouts for creative presentations",
    thumbnail:
      "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&q=80",
    category: "creative",
  },
  {
    id: "creative-2",
    name: "Bold Shapes",
    description:
      "Geometric shapes and bold colors for impactful creative presentations",
    thumbnail:
      "https://images.unsplash.com/photo-1550859492-d5da9d8e45f3?w=400&q=80",
    category: "creative",
  },
  {
    id: "minimal-1",
    name: "Clean White",
    description:
      "Minimalist white design with subtle accents for clean presentations",
    thumbnail:
      "https://images.unsplash.com/photo-1557683316-973673baf926?w=400&q=80",
    category: "minimal",
  },
  {
    id: "minimal-2",
    name: "Simple Black",
    description:
      "Elegant black background with minimal elements for sophisticated slides",
    thumbnail:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80",
    category: "minimal",
  },
];

const TemplateSelector = ({
  selectedTemplate = "",
  onSelectTemplate = () => {},
  templates = defaultTemplates,
}: TemplateSelectorProps) => {
  return (
    <div className="w-full bg-background p-6 rounded-lg">
      <h2 className="text-2xl font-bold mb-6">Choose a Template</h2>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Templates</TabsTrigger>
          <TabsTrigger value="professional">Professional</TabsTrigger>
          <TabsTrigger value="creative">Creative</TabsTrigger>
          <TabsTrigger value="minimal">Minimal</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <TemplateGrid
            templates={templates}
            selectedTemplate={selectedTemplate}
            onSelectTemplate={onSelectTemplate}
          />
        </TabsContent>

        <TabsContent value="professional" className="space-y-6">
          <TemplateGrid
            templates={templates.filter((t) => t.category === "professional")}
            selectedTemplate={selectedTemplate}
            onSelectTemplate={onSelectTemplate}
          />
        </TabsContent>

        <TabsContent value="creative" className="space-y-6">
          <TemplateGrid
            templates={templates.filter((t) => t.category === "creative")}
            selectedTemplate={selectedTemplate}
            onSelectTemplate={onSelectTemplate}
          />
        </TabsContent>

        <TabsContent value="minimal" className="space-y-6">
          <TemplateGrid
            templates={templates.filter((t) => t.category === "minimal")}
            selectedTemplate={selectedTemplate}
            onSelectTemplate={onSelectTemplate}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface TemplateGridProps {
  templates: TemplateOption[];
  selectedTemplate: string;
  onSelectTemplate: (templateId: string) => void;
}

const TemplateGrid = ({
  templates,
  selectedTemplate,
  onSelectTemplate,
}: TemplateGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map((template) => (
        <TemplateCard
          key={template.id}
          template={template}
          isSelected={selectedTemplate === template.id}
          onSelect={() => onSelectTemplate(template.id)}
        />
      ))}
    </div>
  );
};

interface TemplateCardProps {
  template: TemplateOption;
  isSelected: boolean;
  onSelect: () => void;
}

const TemplateCard = ({
  template,
  isSelected,
  onSelect,
}: TemplateCardProps) => {
  return (
    <motion.div whileHover={{ scale: 1.03 }} transition={{ duration: 0.2 }}>
      <Card
        className={`overflow-hidden cursor-pointer ${isSelected ? "ring-2 ring-primary" : ""}`}
        onClick={onSelect}
      >
        <div className="relative">
          <img
            src={template.thumbnail}
            alt={template.name}
            className="w-full h-48 object-cover"
          />
          {isSelected && (
            <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
              <Check size={16} />
            </div>
          )}
        </div>
        <CardHeader className="pb-2">
          <CardTitle>{template.name}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground">
            {template.description}
          </p>
        </CardContent>
        <CardFooter>
          <Button
            variant={isSelected ? "default" : "outline"}
            size="sm"
            className="w-full"
            onClick={onSelect}
          >
            {isSelected ? "Selected" : "Select Template"}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default TemplateSelector;
