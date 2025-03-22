import React from 'react';

export default class ErrorComp extends React.Component<any, {error: any}> {
  constructor(props: any) {
    super(props);
    this.state = {
      error: undefined,
    };
  }
  static getDerivedStateFromError(error: any): {error: any} {
    return {
      error,
    };
  }
  // componentDidCatch(error: any, errorInfo: any): void {
  //   console.log(error);
  //   console.log(errorInfo);
  // }

  render(): any {
    const {error} = this.state;

    if (error) {
      return (
        <div className="bd">
          <p>出错了～ 😭</p>
          <span>{error.message}</span>
        </div>
      );
    }

    return this.props.children;
  }
}
