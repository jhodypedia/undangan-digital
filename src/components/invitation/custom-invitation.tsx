import {
  renderCustomTemplate,
  type CustomTemplateData,
} from "@/lib/custom-template";
import type { TemplateConfig } from "@/lib/template-config";

export function CustomInvitation({
  config,
  data,
}: {
  config: TemplateConfig;
  data: CustomTemplateData;
}) {
  const { html, css } = renderCustomTemplate(config, data);

  return (
    <div className="cv-root" style={{ background: "var(--tpl-background)" }}>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
