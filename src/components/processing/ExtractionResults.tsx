import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "../ui/card";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Edit2, Check, X, FileText, Shapes, Save } from "lucide-react";

interface ExtractionResultsProps {
  results?: {
    text: string;
    textRegions?: Array<{
      id: string;
      text: string;
      bbox: number[];
      confidence: number;
    }>;
    diagrams: Array<{
      id: string;
      type: string;
      coordinates: { x: number; y: number }[];
      label?: string;
      data?: any;
      imageData?: string;
      confidence?: number;
      vectorized?: boolean;
    }>;
    equations?: Array<{
      id: string;
      latex: string;
      mathml: string;
      coordinates: { x: number; y: number; width: number; height: number };
      confidence: number;
      rendered?: string;
    }>;
    documentStructure?: any;
    metadata?: {
      textConfidence: number;
      structureConfidence: number;
      processingMetadata: any;
    };
  };
  onSaveChanges?: (data: any) => void;
  isLoading?: boolean;
}

const ExtractionResults = ({
  results = {
    text: "# Meeting Notes\n\n## Action Items\n- Research competitor pricing\n- Schedule follow-up meeting\n- Prepare Q3 forecast\n\n## Key Decisions\n1. Launch new product in October\n2. Increase marketing budget by 15%\n3. Hire two additional developers",
    diagrams: [
      {
        id: "diagram-1",
        type: "flowchart",
        coordinates: [
          { x: 10, y: 10 },
          { x: 100, y: 100 },
          { x: 200, y: 50 },
        ],
        label: "User Flow Diagram",
      },
      {
        id: "diagram-2",
        type: "box",
        coordinates: [
          { x: 300, y: 200 },
          { x: 400, y: 300 },
        ],
        label: "Revenue Model",
      },
    ],
  },
  onSaveChanges = () => {},
  isLoading = false,
}: ExtractionResultsProps) => {
  const [editingText, setEditingText] = useState(false);
  const [editedText, setEditedText] = useState(results.text);
  const [selectedDiagram, setSelectedDiagram] = useState<string | null>(null);

  const handleSaveChanges = () => {
    // Preserve all the original data but update the edited text
    onSaveChanges({
      ...results,
      text: editedText,
    });
    setEditingText(false);
  };

  const handleCancelEdit = () => {
    setEditedText(results.text);
    setEditingText(false);
  };

  return (
    <div className="w-full bg-background p-4 rounded-lg">
      <Tabs defaultValue="text" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="text">
            <FileText className="mr-2 h-4 w-4" />
            Extracted Text
          </TabsTrigger>
          <TabsTrigger value="diagrams">
            <Shapes className="mr-2 h-4 w-4" />
            Identified Diagrams
          </TabsTrigger>
          {results.equations && results.equations.length > 0 && (
            <TabsTrigger value="equations">
              <svg
                className="mr-2 h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
              Equations
            </TabsTrigger>
          )}
          {results.documentStructure && (
            <TabsTrigger value="structure">
              <svg
                className="mr-2 h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18M9 21V9" />
              </svg>
              Document Structure
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="text" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Extracted Text Content</CardTitle>
                {!editingText ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingText(true)}
                    disabled={isLoading}
                  >
                    <Edit2 className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelEdit}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleSaveChanges}
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Save
                    </Button>
                  </div>
                )}
              </div>
              <CardDescription>
                Text extracted from your whiteboard image. You can edit this
                content before generating slides.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {editingText ? (
                <Textarea
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  className="min-h-[300px] font-mono"
                  placeholder="No text extracted. Edit manually if needed."
                />
              ) : (
                <div className="space-y-4">
                  {results.metadata && (
                    <div className="flex items-center justify-between text-sm bg-blue-50 text-blue-800 p-2 rounded-md">
                      <span>
                        Text extraction confidence:{" "}
                        {(results.metadata.textConfidence * 100).toFixed(1)}%
                      </span>
                      <span>
                        Processing time:{" "}
                        {results.metadata.processingMetadata.processingTime}ms
                      </span>
                    </div>
                  )}
                  <div className="whitespace-pre-wrap bg-gray-50 p-4 rounded-md min-h-[300px] font-mono">
                    {results.text || "No text was extracted from the image."}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="diagrams" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Identified Diagrams</CardTitle>
              <CardDescription>
                Diagrams and visual structures identified in your whiteboard
                image.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {results.diagrams && results.diagrams.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.diagrams.map((diagram) => (
                    <div
                      key={diagram.id}
                      className={`border rounded-md p-4 cursor-pointer transition-all ${selectedDiagram === diagram.id ? "ring-2 ring-primary" : ""}`}
                      onClick={() =>
                        setSelectedDiagram(
                          diagram.id === selectedDiagram ? null : diagram.id,
                        )
                      }
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium">
                          {diagram.label || `${diagram.type} Diagram`}
                        </h3>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                          {diagram.type}
                        </span>
                      </div>
                      <div className="bg-gray-50 h-40 flex items-center justify-center rounded-md overflow-hidden">
                        {diagram.imageData ? (
                          <img
                            src={diagram.imageData}
                            alt={diagram.label || `${diagram.type} Diagram`}
                            className="max-w-full max-h-full object-contain"
                          />
                        ) : diagram.data ? (
                          <div className="w-full h-full p-2">
                            <div className="text-xs font-medium mb-1 text-primary-700">
                              {diagram.type === "flowchart" ? (
                                <span>
                                  Nodes: {diagram.data.nodes?.length || 0},
                                  Connections: {diagram.data.edges?.length || 0}
                                </span>
                              ) : diagram.type === "pie-chart" ? (
                                <span>
                                  {diagram.data.title}:{" "}
                                  {diagram.data.segments?.length || 0} segments
                                </span>
                              ) : diagram.type === "gantt-chart" ? (
                                <span>
                                  {diagram.data.title}:{" "}
                                  {diagram.data.tasks?.length || 0} tasks
                                </span>
                              ) : diagram.type === "mindmap" ? (
                                <span>
                                  {diagram.data.root} with{" "}
                                  {diagram.data.children?.length || 0} branches
                                </span>
                              ) : (
                                <span>Diagram data available</span>
                              )}
                              {diagram.confidence && (
                                <span className="ml-2 bg-green-100 text-green-800 px-1 py-0.5 rounded text-xs">
                                  {(diagram.confidence * 100).toFixed(0)}%
                                </span>
                              )}
                            </div>
                            <div className="bg-primary-50 rounded p-1 text-xs overflow-auto h-[calc(100%-20px)]">
                              {JSON.stringify(diagram.data, null, 2)}
                            </div>
                          </div>
                        ) : (
                          <div className="text-gray-400 text-sm">
                            Diagram Preview
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No diagrams were identified in the image.
                </div>
              )}
            </CardContent>
            {selectedDiagram && (
              <CardFooter className="flex justify-end">
                <Button variant="outline" size="sm" className="mr-2">
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit Diagram
                </Button>
                <Button variant="default" size="sm">
                  <Save className="mr-2 h-4 w-4" />
                  Apply Changes
                </Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>

        {results.equations && results.equations.length > 0 && (
          <TabsContent value="equations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Mathematical Equations</CardTitle>
                <CardDescription>
                  Mathematical equations detected and parsed from your
                  whiteboard image.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.equations.map((equation) => (
                    <div key={equation.id} className="border rounded-md p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium">Equation</h3>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {(equation.confidence * 100).toFixed(0)}% confidence
                        </span>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-md mb-2 flex items-center justify-center min-h-[80px]">
                        {equation.rendered ? (
                          <img
                            src={equation.rendered}
                            alt="Rendered equation"
                            className="max-w-full"
                          />
                        ) : (
                          <div className="text-gray-500 italic">
                            LaTeX: {equation.latex}
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 mt-2">
                        <div className="font-mono text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                          {equation.latex}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {results.documentStructure && (
          <TabsContent value="structure" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Document Structure Analysis</CardTitle>
                <CardDescription>
                  Structural analysis of your whiteboard content showing
                  organization and layout.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {results.documentStructure?.title && (
                    <div className="border-b pb-2">
                      <h3 className="font-medium text-lg">Document Title</h3>
                      <p className="text-primary font-medium">
                        {results.documentStructure.title.text}
                      </p>
                    </div>
                  )}

                  <h3 className="font-medium text-lg">Sections</h3>
                  <div className="space-y-4">
                    {results.documentStructure?.sections?.map(
                      (section: any, index: number) => (
                        <div key={index} className="border rounded-md p-4">
                          <h4 className="font-medium">
                            {section.heading?.text}
                          </h4>

                          {section.paragraphs?.length > 0 && (
                            <div className="mt-2">
                              <h5 className="text-sm font-medium text-gray-600">
                                Paragraphs
                              </h5>
                              <div className="pl-4 border-l-2 border-gray-200 mt-1">
                                {section.paragraphs.map(
                                  (para: any, pIndex: number) => (
                                    <p key={pIndex} className="text-sm my-1">
                                      {para.text}
                                    </p>
                                  ),
                                )}
                              </div>
                            </div>
                          )}

                          {section.lists?.length > 0 && (
                            <div className="mt-2">
                              <h5 className="text-sm font-medium text-gray-600">
                                Lists
                              </h5>
                              {section.lists.map(
                                (list: any, lIndex: number) => (
                                  <div
                                    key={lIndex}
                                    className="pl-4 border-l-2 border-gray-200 mt-1"
                                  >
                                    {list.ordered ? (
                                      <ol className="list-decimal pl-5 text-sm">
                                        {list.items?.map(
                                          (item: string, iIndex: number) => (
                                            <li key={iIndex}>{item}</li>
                                          ),
                                        )}
                                      </ol>
                                    ) : (
                                      <ul className="list-disc pl-5 text-sm">
                                        {list.items?.map(
                                          (item: string, iIndex: number) => (
                                            <li key={iIndex}>{item}</li>
                                          ),
                                        )}
                                      </ul>
                                    )}
                                  </div>
                                ),
                              )}
                            </div>
                          )}

                          {section.tables?.length > 0 && (
                            <div className="mt-2">
                              <h5 className="text-sm font-medium text-gray-600">
                                Tables
                              </h5>
                              {section.tables.map(
                                (table: any, tIndex: number) => (
                                  <div
                                    key={tIndex}
                                    className="overflow-x-auto mt-1"
                                  >
                                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                                      <thead className="bg-gray-50">
                                        <tr>
                                          {table.data?.[0]?.map(
                                            (
                                              header: string,
                                              hIndex: number,
                                            ) => (
                                              <th
                                                key={hIndex}
                                                className="px-3 py-2 text-left font-medium text-gray-500"
                                              >
                                                {header}
                                              </th>
                                            ),
                                          )}
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-200 bg-white">
                                        {table.data
                                          ?.slice(1)
                                          ?.map(
                                            (row: string[], rIndex: number) => (
                                              <tr key={rIndex}>
                                                {row.map(
                                                  (
                                                    cell: string,
                                                    cIndex: number,
                                                  ) => (
                                                    <td
                                                      key={cIndex}
                                                      className="px-3 py-2"
                                                    >
                                                      {cell}
                                                    </td>
                                                  ),
                                                )}
                                              </tr>
                                            ),
                                          )}
                                      </tbody>
                                    </table>
                                  </div>
                                ),
                              )}
                            </div>
                          )}
                        </div>
                      ),
                    )}
                  </div>

                  {results.documentStructure?.figures?.length > 0 && (
                    <div>
                      <h3 className="font-medium text-lg mt-4">Figures</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        {results.documentStructure.figures.map(
                          (figure: any, fIndex: number) => (
                            <div key={fIndex} className="border rounded-md p-3">
                              <div className="bg-gray-100 h-32 flex items-center justify-center rounded">
                                <span className="text-gray-500">
                                  Figure {fIndex + 1}
                                </span>
                              </div>
                              {figure.caption && (
                                <p className="text-sm text-center mt-2 text-gray-600">
                                  {figure.caption}
                                </p>
                              )}
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default ExtractionResults;
