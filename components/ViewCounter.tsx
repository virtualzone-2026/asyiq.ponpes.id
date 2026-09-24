'use client';

import {
  useEffect,
  useState,
} from 'react';

type ViewType =
  | 'blog'
  | 'campaign'
  | 'fundraiser';

interface ViewCounterProps {
  type: ViewType;
  contentKey: string;

  /**
   * true:
   * buka halaman = view bertambah.
   *
   * false:
   * hanya menampilkan angka.
   */
  increment?: boolean;

  className?: string;
}

export default function ViewCounter({
  type,
  contentKey,
  increment = true,
  className = '',
}: ViewCounterProps) {
  const [views, setViews] =
    useState<number | null>(null);

  useEffect(() => {
    if (!contentKey) {
      return;
    }

    const controller =
      new AbortController();

    async function loadViews() {
      try {
        // ==============================================================
        // INCREMENT
        // ==============================================================

        if (increment) {
          const response =
            await fetch(
              '/api/views',
              {
                method: 'POST',

                headers: {
                  'Content-Type':
                    'application/json',
                },

                body:
                  JSON.stringify({
                    type,
                    key:
                      contentKey,
                  }),

                cache:
                  'no-store',

                signal:
                  controller.signal,
              }
            );

          if (response.ok) {
            const data =
              await response.json();

            if (
              typeof data?.views ===
              'number'
            ) {
              setViews(
                data.views
              );

              return;
            }
          }
        }

        // ==============================================================
        // GET ONLY
        // ==============================================================

        const response =
          await fetch(
            `/api/views?type=${encodeURIComponent(
              type
            )}&key=${encodeURIComponent(
              contentKey
            )}`,
            {
              cache:
                'no-store',

              signal:
                controller.signal,
            }
          );

        if (!response.ok) {
          return;
        }

        const data =
          await response.json();

        setViews(
          Number(
            data?.views
          ) || 0
        );
      } catch (error) {
        if (
          error instanceof Error &&
          error.name ===
            'AbortError'
        ) {
          return;
        }

        console.error(
          'ViewCounter error:',
          error
        );
      }
    }

    loadViews();

    return () => {
      controller.abort();
    };
  }, [
    type,
    contentKey,
    increment,
  ]);

  if (views === null) {
    return (
      <span
        className={
          className
        }
      >
        👁 —
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 ${className}`}
      title={`${views.toLocaleString(
        'id-ID'
      )} kali dilihat`}
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />

        <circle
          cx="12"
          cy="12"
          r="3"
        />
      </svg>

      {views.toLocaleString(
        'id-ID'
      )}
    </span>
  );
}