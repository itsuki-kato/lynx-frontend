import { benefits } from "./data";
import { SectionTitle } from "./SectionTitle";
import { IconRenderer } from "./IconRenderer";

/**
 * メリットセクション
 */
export function BenefitsSection() {
  return (
    <section className="w-full py-24 lg:py-32 bg-emerald-600 text-white">
      <div className="container px-4 md:px-6 text-center mx-auto">
        <SectionTitle 
          title="LYNXを導入するメリット"
          lightMode={true}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-white/10 rounded-xl p-10 flex flex-col items-center">
              <div className="bg-white/20 w-20 h-20 rounded-full flex items-center justify-center mb-6">
                <IconRenderer name={benefit.iconName} className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4">{benefit.title}</h3>
              <p className="text-white/90 leading-relaxed">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
