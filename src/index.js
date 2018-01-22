import React, { Component } from 'react';

/******* Setup ********/

const GRAYS = [
  '#9FA8DA',
  '#7986CB',
  '#5C6BC0',
  '#3F51B5',
  '#3949AB',
  '#303F9F',
  '#283593',
  '#1A237E',
];

const SIZES = [200, 100];

const serial = array => {
  let i = 0;
  return () => {
    i = (i + 1) % array.length;
    return array[i];
  };
};

const randomSize = () => SIZES[Math.floor(Math.random() * SIZES.length)];

const serialGrays = serial(GRAYS);

const getRandomDiv = (el, i) => {
  return (
    <div
      key={i}
      style={{
        height: randomSize(),
        width: randomSize(),
        background: `${serialGrays()}`,
      }}
    />
  );
};

/******* End Setup ********/

function initArray(size) {
  return Array(size).fill(0);
}

class Masonry extends Component {
  gridRef = null;
  gridFilledBoundary = [];

  constructor() {
    super();

    this._addChild = this._addChild.bind(this);
    this._canFit = this._canFit.bind(this);
    this._updateGridBoundary = this._updateGridBoundary.bind(this);
    this._placeElement = this._placeElement.bind(this);
    this._render = this._render.bind(this);
  }

  componentDidMount() {
    this._render();
    window.addEventListener('resize', this._render);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._render);
  }

  /**
   *  Loop through the gridFilledBoundary
   *  Find optimal position (Magic?)
   *  Min(y) that satisfies for x to x + element.offsetWidth
   *  If y found that satisfies, skip till next y < currentMinY
   *  Update gridFilledBoundary
   *
   * @param {HTMLElement} element
   */
  _addChild(element) {
    let optimalPosition = { x: 0, y: Math.max(...this.gridFilledBoundary) };
    const width = element.offsetWidth;

    for (let x = 0; x < this.gridFilledBoundary.length - width; x++) {
      const columnHeight = this.gridFilledBoundary[x];

      // For compact stacking, minimize Y, Early return if columnHeight > foundMinY
      if (columnHeight >= optimalPosition.y) continue;

      // Element can fit at given Y co-ordianate
      if (this._canFit(x, element)) {
        optimalPosition = {
          x,
          y: columnHeight,
        };
      }
    }

    this._updateGridBoundary(element, optimalPosition);
    this._placeElement(element, optimalPosition);
  }

  /**
   * Checks if an element can fit at Position(x)
   *
   * @param {Number} x
   * @param {HTMLElement} element
   */
  _canFit(x, element) {
    const gridFilledBoundary = this.gridFilledBoundary;

    const width = element.offsetWidth;
    const y = gridFilledBoundary[x];

    const portion = gridFilledBoundary.slice(x, x + width);

    return portion.every(value => value <= y);
  }

  _placeElement(element, position) {
    element.style.top = `${position.y}px`;
    element.style.left = `${position.x}px`;

    const timing = '400ms cubic-bezier(0.455, 0.03, 0.515, 0.955)';
    element.style.transition = `top ${timing}, left ${timing}`;
  }

  /**
   * Update the gridFilledBoundary post element placement
   *
   * @param {HTMLElement} element
   * @param {Position} position
   */
  _updateGridBoundary(element, position) {
    const width = element.offsetWidth;
    const boundaryY = position.y + element.offsetHeight;

    for (let x = position.x; x < position.x + width; x++) {
      this.gridFilledBoundary[x] = boundaryY;
    }
  }

  _render() {
    this.gridFilledBoundary = initArray(this.gridRef.offsetWidth);

    const children = this.gridRef.children;

    for (let child of children) {
      child.style.position = 'absolute';
      this._addChild(child);
    }
  }

  render() {
    return (
      <div
        ref={node => {
          this.gridRef = node;
        }}
        style={{ position: 'relative' }}
      >
        {this.props.children}
      </div>
    );
  }
}

class Usage extends Component {
  render() {
    return (
      <Masonry>
        {Array(14)
          .fill(0)
          .map(getRandomDiv)}
      </Masonry>
    );
  }
}

export default Usage;
