import React from "react";

type Props = { children: React.ReactNode };
type State = { hasError: boolean; message?: string };

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { hasError: true, message };
  }

  componentDidCatch(err: unknown) {
    // In ra Console để bạn chụp gửi mình nếu cần
    console.error("ErrorBoundary caught:", err);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, fontFamily: "sans-serif" }}>
          <h2 style={{ color: "crimson" }}>Có lỗi khi render trang</h2>
          <p><b>Thông báo:</b> {this.state.message}</p>
          <p>Mở F12 → Console để xem chi tiết (hoặc chụp màn hình gửi mình).</p>
        </div>
      );
    }
    return this.props.children;
  }
}
