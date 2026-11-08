import { Component } from "react";
import WheelFallback from "./WheelFallback.jsx";

export default class SceneBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="wheel-scene">
          <WheelFallback />
          <span className="wheel-hint">Каждая деталь имеет значение</span>
        </div>
      );
    }
    return this.props.children;
  }
}
