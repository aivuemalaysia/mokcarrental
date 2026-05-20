import { Component } from 'react';

export default class ErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean; message: string }
> {
  state = { hasError: false, message: '' };

  static getDerivedStateFromError(error: unknown) {
    const message = typeof (error as any)?.message === 'string' ? (error as any).message : 'Unexpected error';
    return { hasError: true, message };
  }

  componentDidCatch(error: unknown) {
    console.error('IK: UI error boundary caught', error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="max-w-lg w-full rounded-2xl bg-white p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Something went wrong</h2>
          <p className="mt-2 text-sm text-gray-600">{this.state.message}</p>
          <button
            type="button"
            className="mt-4 px-4 py-2 rounded-lg bg-gold-500 text-white hover:bg-gold-600"
            onClick={() => this.setState({ hasError: false, message: '' })}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }
}

