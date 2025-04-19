import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { ArrowRight } from "lucide-react";
import { testimonials } from "./data";
import { SectionTitle } from "./SectionTitle";

/**
 * 事例紹介セクション
 */
export function TestimonialsSection() {
  return (
    <section className="w-full py-24 lg:py-32 bg-muted/40">
      <div className="container px-4 md:px-6">
        <SectionTitle 
          title={<>導入<span className="text-emerald-600">事例</span></>}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-background shadow-md">
              <CardContent className="p-8 flex flex-col h-full">
                <p className="text-muted-foreground mb-6 flex-1 leading-relaxed">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-4">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name} 
                    className="w-16 h-16 rounded-full object-cover" 
                  />
                  <div>
                    <p className="font-semibold text-lg">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.position}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.company}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center">
          <Link to="/login">
            <Button variant="outline" className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 flex items-center gap-2">
              すべての事例を見る
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
