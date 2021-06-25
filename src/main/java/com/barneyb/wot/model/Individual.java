package com.barneyb.wot.model;

import lombok.Data;
import lombok.val;
import org.apache.jena.rdf.model.Resource;

@Data
public class Individual {

    public static Individual from(Resource r) {
        val i = new Individual();
        i.setIri(r.getURI());
        return i;
    }

    String iri;

}
