import {
    FacebookIcon,
    GithubIcon,
    Sparkles,
    InstagramIcon,
    LinkedinIcon,
    TwitterIcon,
    YoutubeIcon,
} from 'lucide-react';
import Link from 'next/link';

export function MinimalFooter() {
    const year = new Date().getFullYear();

    const company = [
        {
            title: 'About Us',
            href: '/about',
        },
        {
            title: 'Careers',
            href: '/careers',
        },
        {
            title: 'Press Kit',
            href: '/press',
        },
        {
            title: 'Privacy Policy',
            href: '/privacy',
        },
        {
            title: 'Terms of Service',
            href: '/terms',
        },
    ];

    const resources = [
        {
            title: 'Blog',
            href: '/blog',
        },
        {
            title: 'Help Center',
            href: '/help',
        },
        {
            title: 'API Docs',
            href: '/docs',
        },
        {
            title: 'PR Templates',
            href: '/templates',
        },
        {
            title: 'Contact Support',
            href: '/support',
        },
    ];

    const socialLinks = [
        {
            icon: <FacebookIcon className="size-5" />,
            link: '#',
        },
        {
            icon: <GithubIcon className="size-5" />,
            link: '#',
        },
        {
            icon: <InstagramIcon className="size-5" />,
            link: '#',
        },
        {
            icon: <LinkedinIcon className="size-5" />,
            link: '#',
        },
        {
            icon: <TwitterIcon className="size-5" />,
            link: '#',
        },
        {
            icon: <YoutubeIcon className="size-5" />,
            link: '#',
        },
    ];

    return (
        <footer className="relative py-16 md:py-20">
            <div className="bg-[radial-gradient(35%_80%_at_30%_0%,--theme(--color-foreground/.1),transparent)] mx-auto max-w-6xl md:border-x">
                <div className="bg-border absolute inset-x-0 h-px w-full" />
                <div className="grid max-w-6xl grid-cols-6 gap-8 md:gap-12 p-8 md:p-12">
                    <div className="col-span-6 flex flex-col gap-8 md:col-span-4">
                        <Link href="/" className="w-max opacity-25">
                            <Sparkles className="size-12" />
                        </Link>
                        <p className="text-muted-foreground max-w-lg font-mono text-base md:text-lg text-balance leading-relaxed">
                            AI-powered PR platform transforming media outreach for modern teams. 
                            Generate compelling pitches, target the right journalists, and track your coverage in real-time.
                        </p>
                        <div className="flex gap-3">
                            {socialLinks.map((item, i) => (
                                <a
                                    key={i}
                                    className="hover:bg-accent rounded-lg border p-3 transition-colors hover:scale-105 transform duration-200"
                                    target="_blank"
                                    href={item.link}
                                    rel="noopener noreferrer"
                                >
                                    {item.icon}
                                </a>
                            ))}
                        </div>
                    </div>
                    <div className="col-span-3 w-full md:col-span-1">
                        <span className="text-muted-foreground mb-4 text-sm font-semibold uppercase tracking-wider">
                            Resources
                        </span>
                        <div className="flex flex-col gap-3">
                            {resources.map(({ href, title }, i) => (
                                <a
                                    key={i}
                                    className="w-max py-2 text-base duration-200 hover:underline hover:text-primary"
                                    href={href}
                                >
                                    {title}
                                </a>
                            ))}
                        </div>
                    </div>
                    <div className="col-span-3 w-full md:col-span-1">
                        <span className="text-muted-foreground mb-4 text-sm font-semibold uppercase tracking-wider">
                            Company
                        </span>
                        <div className="flex flex-col gap-3">
                            {company.map(({ href, title }, i) => (
                                <a
                                    key={i}
                                    className="w-max py-2 text-base duration-200 hover:underline hover:text-primary"
                                    href={href}
                                >
                                    {title}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="bg-border absolute inset-x-0 h-px w-full" />
                <div className="flex max-w-6xl flex-col justify-between gap-4 pt-8 pb-8 px-8 md:px-12">
                    <div className="text-center space-y-2">
                        <p className="text-muted-foreground text-base">
                            © AI PR Platform. All rights reserved {year}
                        </p>
                        <p className="text-muted-foreground text-sm">
                            Empowering PR professionals with AI-driven insights and automation
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
