import { toast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form"
import { z } from "zod"

const schema = z.object({
  firstName: z.string().min(2, {message: "至少2个字符"}),
  lastName: z.string().min(2, {message: "至少2个字符"}),
});

export function TestToggle() {
  const form = useForm({
    resolver: zodResolver(schema),
    mode: "onSubmit", // 验证模式
  });
  const onSubmit = (data: any) => {
    console.log(data);
    toast({
      title: "提交成功",
      description: (
        <pre>
          <code>
            {JSON.stringify(data, null, 2)}
          </code>
        </pre>
      )
    })
  };
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register('firstName')}/>
      {
        form.formState.errors.firstName && (
          <div>{form.formState.errors.firstName.message as string}</div>
        )
      }
      <input {...form.register('lastName')} />
      <button type="submit">Submit</button>
    </form>
  ); 
}


