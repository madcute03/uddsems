import { Head, Link } from "@inertiajs/react";
import PublicLayout from "@/Layouts/PublicLayout";

export default function ShowNews({ news }) {
    const item = news;
    const formatDateTime = (dt) => (dt ? new Date(dt).toLocaleString() : "");

    return (
        <PublicLayout>
            <Head title={item.title} />
            <section>
                    <img
                        src={`/storage/${item.cover_image}`}
                        alt={item.title}
                        className="w-screen h-[500px] object-cover object-center"
                    />
            </section>
            <div className=" max-w-3xl px-6">
                
                <div className="py-6">
                        <h1 className="text-5xl font-bold">{item.title}</h1>
                  </div>
                <article>
                    <div className="max-w-3xl ">
                        <div className="text-2xl text-slate-300 mb-3">
                            <span> Published: {formatDateTime(item.published_at || item.created_at)}</span>
                            {item.author && <span> By: {item.author}</span>}
                            {item.location && <span> • {item.location}</span>}
                        </div>
                      
                        
                        <section className="prose prose-invert max-w-none">
                            <p className="whitespace-pre-wrap text-xl">
                                {item.content}
                            </p>
                        </section>
                    </div>
                </article>
            </div>
        </PublicLayout>
    );
}
