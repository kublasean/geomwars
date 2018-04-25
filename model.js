/*------ functions common to renderable objects (models) ------*/

var Model = {

objectTransforms: function(model) {
  mvTranslate(model.translation[0], model);
  model.rotation[1].forEach(function(rot,i,arr) { mvRotate(rot[0], rot[1], model)});
  mvTranslate(model.translation[1], model);
  model.rotation[0].forEach(function(rot,i,arr) { mvRotate(rot[0], rot[1], model)});
  mvScale2(model.scale_arr, model);
  mvScale(model.scale, model);
  mvTranslate([model.center[0]*-1, model.center[1]*-1, model.center[2]*-1], model);
},

draw: function(model, proj, view) {
  gl.useProgram(model.shader.program);

  model.uniforms.u_projection = new Float32Array(proj.flatten());
  model.uniforms.u_view = new Float32Array(view.flatten());

  mvLoadIdentity(model);
  Model.objectTransforms(model);

  model.uniforms.u_model = new Float32Array(model.mvMatrix.flatten());

  setUniforms(model.shader.uniformSetters, model.uniforms);
  setAttributes(model.shader.attribSetters, model.attribs);

  if (model.actuallyPoints) 
    gl.drawArrays(gl.POINTS, 0, model.numtri)
  else if (model.points)                //var name is a misnomer, like numtri
    gl.drawArrays(gl.LINE_STRIP, 0, model.numtri);
  else
    gl.drawArrays(gl.TRIANGLES, 0, model.numtri);
},

updateActions: function(model) {
  for (var i=0; i<model.updateList.length; i++) {
    if(model.updateList[i](model)) {
      model.updateList.splice(i,1);
      i--;
    }
  }
  return model.updateList.length;
},

updateWorldPosition: function(model) {
  mvLoadIdentity(model);
  Model.objectTransforms(model);
  var worldPosition = model.mvMatrix.multiply(Matrix.create(model.center));
  model.position = Vector.create(worldPosition.flatten().slice(0,2));
  return worldPosition;
},

updateTranslation: function(model) {
  var prod = model.velocity.multiply(model.delta).elements;
  model.translation[0][0] += prod[0];
  model.translation[0][1] += prod[1];
},

touching: function(model, other) {
  var a = model.position;
  var b = other.position;
  var dist = b.distanceFrom(a);
  if (dist < model.radius*model.scale + other.radius*other.scale)
    return true;
 return false;
}

}
